import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { INVENTORY_SERVICE, Product, User, Variant } from '@app/common';
import { Cart, CartItem } from '@app/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Types } from 'mongoose';
import { CreateCartDto } from './dto/create-cart.dto';
import { AddCartDto } from './dto/add-cart.dto';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CartItemService } from './cart-item/cart-item.service';
import { UpdateCartDto } from './dto/update-cart.dto';
import { UpdateCartAction } from './enums/update-cart-action.enum';
import { DeleteCartItemDto } from './dto/delete-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>,
    @Inject(INVENTORY_SERVICE) private readonly inventoryService: ClientProxy,
    private readonly cartItemService: CartItemService,
  ) {}

  async validate(id: Types.ObjectId | string) {
    const fcart = await this.cartModel
      .findOne({ $or: [{ user: id }, { _id: id }] })
      .populate({ path: 'items' });

    if (!fcart) return;

    const cart = await fcart.populate([
      {
        path: 'items.productId',
        select: 'product_id price total title images isPublished',
      },
      {
        path: 'items.variantId',
        select: '_id color size inventory productId',
      },
    ]);

    return cart;
  }

  async createCart(createCartDto: CreateCartDto) {
    const newCart = new this.cartModel({
      ...createCartDto,
      _id: new Types.ObjectId(),
    });

    return newCart.save();
  }

  async getCart(user: User): Promise<Cart> {
    try {
      const cart = await this.validate(user._id);

      if (!cart) {
        const cartData = {
          user: user._id,
          items: [],
          subTotal: 0,
        };
        return this.createCart(cartData);
      } else {
        await Promise.all(
          cart.items.map(async (item: CartItem) => {
            if (!item.productId && user) {
              await this.cartModel.findOneAndUpdate(
                { user: user._id },
                {
                  $pull: {
                    items: {
                      _id: item._id,
                    },
                  },
                },
              );

              const newCart = await this.validate(user._id);

              if (newCart) {
                newCart.items.length <= 0
                  ? (newCart.subTotal = 0)
                  : (newCart.subTotal = newCart.items
                      .map((item) => item.total)
                      .reduce((acc, next) => acc + next));

                await newCart.save();
              }
            }
            if (item.productId && item.productId.price !== item.price) {
              await this.cartItemService.updatePriceItem(item._id.toString(), {
                price: item.productId.price,
                total: item.productId.price * item.quantity,
              });

              const newCart = await this.validate(user._id);

              if (newCart) {
                newCart.items.length <= 0
                  ? (newCart.subTotal = 0)
                  : (newCart.subTotal = newCart.items
                      .map((item) => item.total)
                      .reduce((acc, next) => acc + next));

                await newCart.save();
              }
            }
          }),
        );
      }
      return this.validate(user._id);
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getProduct(id: string) {
    try {
      const res = await firstValueFrom(
        this.inventoryService.send<Product>('product-validate', id),
      );
      return res;
    } catch (error) {
      throw new RpcException(error.response);
    }
  }

  async validateItem(id: string, quantity: number) {
    try {
      const res = await firstValueFrom(
        this.inventoryService.send<Variant>('variant-validate', {
          id,
          quantity,
        }),
      );
      return res;
    } catch (error) {
      throw new RpcException(error.response);
    }
  }

  async addCart(addCartDto: AddCartDto, user: User): Promise<Cart> {
    const { productId, variantId, quantity } = addCartDto;

    const cart = await this.validate(user._id);

    // validate item before add cart
    const product = await this.getProduct(productId);

    if (!product.variants.find((variant) => variant.toString() === variantId)) {
      throw new NotFoundException(
        `This product [${productId}] not includes this variant [${variantId}].`,
      );
    }

    await this.validateItem(variantId, quantity);

    // create new item object
    const newItem = {
      productId,
      variantId,
      quantity,
      price: product.price,
      total: Number(product.price * quantity),
    };

    //--If Cart Exists ----
    if (cart) {
      //---- check if index exists ----
      const indexFound = cart.items.findIndex((item) => {
        return item.variantId._id.toString() === variantId.toString();
      });
      //------this removes an item from the the cart if the quantity is set to zero,We can use this method to remove an item from the list  -------
      if (indexFound !== -1 && quantity <= 0) {
        cart.items.splice(indexFound, 1);
        if (cart.items.length <= 0) {
          cart.subTotal = 0;
        } else {
          cart.subTotal = cart.items
            .map((item: CartItem) => item.total)
            .reduce((acc: number, next: number) => acc + next);
        }
      }
      //----------check if product exist,just add the previous quantity with the new quantity and update the total price-------
      else if (indexFound !== -1) {
        const newItem = {
          quantity: cart.items[indexFound].quantity + quantity,
          total: (cart.items[indexFound].quantity + quantity) * product.price,
          price: product.price,
        };
        const item = await this.cartItemService.updateItem(
          cart.items[indexFound]._id.toString(),
          newItem,
        );

        cart.items[indexFound].quantity = item.quantity;
        cart.items[indexFound].total = item.total;
        cart.items[indexFound].price = item.price;

        cart.subTotal = cart.items
          .map((item: CartItem) => item.total)
          .reduce((acc: number, next: number) => acc + next);
      }
      //----Check if Quantity is Greater than 0 then add item to items Array ----
      else if (quantity > 0) {
        const item = await this.cartItemService.createItem(newItem);
        cart.items.push(item);
        cart.subTotal = cart.items
          .map((item: CartItem) => item.total)
          .reduce((acc: number, next: number) => acc + next);
      }
      //----if quantity of price is 0 throw the error -------
      else {
        throw new InternalServerErrorException();
      }

      await cart.save();

      return cart.populate([
        {
          path: 'items.productId',
          select: 'product_id price total title images isPublished',
        },
        {
          path: 'items.variantId',
          select: '_id color size inventory productId',
        },
      ]);
    }
    //------------ if there is no user with a cart...it creates a new cart and then adds the item to the cart that has been created------------
    else {
      const item = await this.cartItemService.createItem(newItem);
      const cartData = {
        user: user._id,
        items: [item],
        subTotal: Number(product.price * quantity),
      };

      const cart = await this.createCart(cartData);
      return cart.populate([
        {
          path: 'items.productId',
          select: 'product_id price total title images isPublished',
        },
        {
          path: 'items.variantId',
          select: '_id color size inventory productId',
        },
      ]);
    }
  }

  async updateCart(
    updateCartDto: UpdateCartDto,
    updateAction: UpdateCartAction,
    user: User,
  ): Promise<Cart> {
    const { cartId, itemId } = updateCartDto;

    const cart = await this.validate(cartId);

    if (!cart || cart.user.toString() !== user._id.toString()) {
      throw new NotFoundException(`This cart id: ${cartId} not exists.`);
    }

    const indexFound = cart.items.findIndex(
      (item: CartItem) => item._id.toString() == itemId,
    );

    if (indexFound !== -1) {
      if (
        updateAction === UpdateCartAction.DECREMENT &&
        cart.items[indexFound].quantity === 1
      ) {
        throw new InternalServerErrorException(
          `Quantity must be greater than 1`,
        );
      }
      const product = await this.getProduct(
        cart.items[indexFound].productId._id.toString(),
      );

      let newItem: { quantity: number; total: number };

      if (updateAction === UpdateCartAction.INCREMENT) {
        newItem = {
          quantity: cart.items[indexFound].quantity + 1,
          total: (cart.items[indexFound].quantity + 1) * product.price,
        };
      }
      if (updateAction === UpdateCartAction.DECREMENT) {
        newItem = {
          quantity: cart.items[indexFound].quantity - 1,
          total: (cart.items[indexFound].quantity - 1) * product.price,
        };
      }

      const item = await this.cartItemService.updateItem(
        cart.items[indexFound]._id.toString(),
        newItem,
      );

      cart.items[indexFound].quantity = item.quantity;
      cart.items[indexFound].total = item.total;

      cart.subTotal = cart.items
        .map((item: CartItem) => item.total)
        .reduce((acc: number, next: number) => acc + next);
    }

    return cart.save();
  }

  async deleteCartItem(
    deleteItemDto: DeleteCartItemDto,
    user: User,
  ): Promise<Cart> {
    const { cartId, itemId } = deleteItemDto;

    //validate
    await this.cartRepository.findOne({
      _id: cartId,
      items: itemId,
      user: user._id.toString(),
    });

    await this.cartModel.findByIdAndUpdate(cartId, {
      $pull: {
        items: {
          $in: [itemId],
        },
      },
    });

    await this.cartItemService.deleteItem(itemId);

    const newCart = await this.validate(cartId);

    newCart.items.length === 0
      ? (newCart.subTotal = 0)
      : (newCart.subTotal = newCart.items
          .map((item: CartItem) => item.total)
          .reduce((acc: number, next: number) => acc + next));

    return newCart.save();
  }

  async emptyCart(userId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ user: userId });

    if (!cart) {
      throw new NotFoundException(
        `This cart with user id: ${userId} not exists.`,
      );
    }

    await this.cartItemService.deleteArrayItems(cart.items);

    cart.items = [];
    cart.subTotal = 0;

    return cart.save();
  }

  async getCartFromService(userId: string) {
    const fcart = await this.cartModel
      .findOne({ user: userId })
      .populate({ path: 'items' });

    if (!fcart) {
      throw new RpcException(new NotFoundException('Cart is not found.'));
    }

    const cart = await fcart.populate([
      {
        path: 'items.productId',
        select: 'product_id price total title images isPublished',
      },
      {
        path: 'items.variantId',
        select: '_id color size inventory productId',
      },
    ]);

    return cart;
  }

  async emptyCartFromService(userId: string): Promise<Cart> {
    const cart = await this.cartModel.findOne({ user: userId });

    if (!cart) {
      throw new RpcException(
        new NotFoundException(
          `This cart with user id: [${userId}] not exists.`,
        ),
      );
    }

    await this.cartItemService.deleteArrayItems(cart.items);

    cart.items = [];
    cart.subTotal = 0;

    return cart.save();
  }

  async updatePriceCartItem(productId: string, price: number) {
    return this.cartItemService.updatePrice(productId, price);
  }
}
