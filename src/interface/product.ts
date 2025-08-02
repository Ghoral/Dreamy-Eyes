export interface IProduct {
  title: string;
  sub_title: string;
  description: string;
  images?: IImage[];
  price?: number;
  quantity?: number;
  power?: number;
  specifications?: Specifications;
  color: any;
  color_quantity: any;
}

export interface IImage {
  path: string;
  relativePath: string;
  name: string;
}

export interface Specifications {
  specifications: Specification[];
  keyValuePairs: KeyValuePairs;
}

export interface KeyValuePairs {
  asdad: string;
  asdasdasd: string;
  adsasdasd: string;
}

export interface Specification {
  label: string;
  value: string;
}
