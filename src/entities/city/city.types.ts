export interface ICityBase {
  name: string;
  slug: string;
  state: string;
  summary: string;
  description?: string;
  imageUrl?: string;
  published: boolean;
}

export interface ICity extends ICityBase {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export type ICreateCityInput = ICityBase;

export type IUpdateCityInput = Partial<ICityBase> & Pick<ICity, "id">;
