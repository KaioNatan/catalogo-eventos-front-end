export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "youtube"
  | "tiktok"
  | "site";

export interface ISocialLinkBase {
  platform: SocialPlatform;
  label: string;
  url: string;
  active: boolean;
  order: number;
}

export interface ISocialLink extends ISocialLinkBase {
  id: number;
}

export type ICreateSocialLinkInput = Omit<ISocialLink, "id">;

export type IUpdateSocialLinkInput = Partial<ICreateSocialLinkInput> &
  Pick<ISocialLink, "id">;
