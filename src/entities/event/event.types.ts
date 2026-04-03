interface IEventBase {
  cityId: number;
  citySlug: string;
  name: string;
  description: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  formattedDate?: string;
  location?: string;
  imageUrl?: string;
  featured: boolean;
  published: boolean;
}

export interface IEvent extends IEventBase {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export type ICreateEventInput = Omit<IEvent, "id" | "createdAt" | "updatedAt">;

export type IUpdateEventInput = Partial<ICreateEventInput> & Pick<IEvent, "id">;
