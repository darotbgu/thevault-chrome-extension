export interface ResponseData<T> {
  success: boolean;
  data: T;
  msg: string;
}
