import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { AbstractDocument } from './abstract.schema';
import { NotFoundException } from '@nestjs/common';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: any;
  constructor(protected readonly model: Model<TDocument>) {}

  async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
    const createDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });

    return (await createDocument.save()).toJSON() as unknown as TDocument;
  }

  async findOne(filterQuery: FilterQuery<TDocument>) {
    const document = await this.model.findOne(filterQuery, {}, { lean: true });

    if (!document) {
      this.logger.warn('Document not found with filter query', filterQuery);
      throw new NotFoundException(
        `[${this.model.collection.collectionName}]: Document with filter query not found.`,
      );
    }

    return document;
  }

  async findById(id: string) {
    const document = await this.model.findById(id, {}, { lean: true });

    if (!document) {
      this.logger.warn(`Document [${id}] not found.`);
      throw new NotFoundException(
        `[${this.model.collection.collectionName}]: Document [${id}] not found.`,
      );
    }

    return document;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ) {
    const document = await this.model.findOneAndUpdate(filterQuery, update, {
      lean: true,
      new: true,
    });

    if (!document) {
      this.logger.warn('Document not found with filter query', filterQuery);
      throw new NotFoundException(
        `[${this.model.collection.collectionName}]: Document with filter query not found.`,
      );
    }

    return document;
  }

  async findByIdAndUpdate(id: string, update: UpdateQuery<TDocument>) {
    const document = await this.model.findByIdAndUpdate(id, update, {
      lean: true,
      new: true,
    });

    if (!document) {
      this.logger.warn(`Document [${id}] not found.`);
      throw new NotFoundException(
        `[${this.model.collection.collectionName}]: Document [${id}] not found.`,
      );
    }

    return document;
  }

  async find(filterQuery?: FilterQuery<TDocument>) {
    if (filterQuery) {
      return this.model.find(filterQuery, {}, { lean: true });
    } else {
      return this.model.find({}, {}, { lean: true });
    }
  }

  async findOneAndDelete(filterQuery: FilterQuery<TDocument>) {
    return this.model.findOneAndDelete(filterQuery, { lean: true });
  }

  async findByIdAndDelete(id: string) {
    const document = await this.model.findByIdAndDelete(id, { lean: true });

    if (!document) {
      this.logger.warn(`Document [${id}] not found.`);
      throw new NotFoundException(
        `[${this.model.collection.collectionName}]: Document [${id}] not found.`,
      );
    }

    return document;
  }

  async deleteMany(filterQuery: FilterQuery<TDocument>) {
    return this.model.deleteMany(filterQuery);
  }

  async updateMany(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ) {
    return this.model.updateMany(filterQuery, update, {
      lean: true,
      new: true,
    });
  }
}
