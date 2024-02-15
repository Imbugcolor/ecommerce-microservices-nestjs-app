export type DataResponse<T> = {
  total: number;
  totalPerPage: number;
  data: T[];
};
