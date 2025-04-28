export interface IProductList {
  id: string;
  created_at: Date;
  images: string;
  title: string;
  sub_title: string;
  description: string;
  color: string;
  price: number;
  quantity: number;
  specifications: ISpecifications;
  power: number;
}

export interface ISpecifications {
  asdasd: string;
}
