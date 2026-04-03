interface IInstitutionalContentFields {
  aboutTitle: string;
  aboutText: string;

  whoWeAreTitle: string;
  whoWeAreText: string;

  purposeTitle: string;
  purposeText: string;

  mission: string;
  vision: string;
  values: string[];
}

interface IInstitutionalContentMeta {
  id: number;
  updatedAt: string;
}

export interface IInstitutionalContent
  extends IInstitutionalContentFields, IInstitutionalContentMeta {}

/** PATCH: `id` obrigatório; demais campos opcionais conforme o BFF aceita atualização parcial. */
export type IUpdateInstitutionalContentInput = { id: number } & Partial<
  Omit<IInstitutionalContent, "id" | "updatedAt">
>;

/** Cadastro do único registro institucional (sem id; servidor define id e updatedAt). */
export type ICreateInstitutionalContentInput = Omit<
  IInstitutionalContent,
  "id" | "updatedAt"
>;
