export type Role = {
  _id: string;
  name: string;
  system: boolean;
  scope: string;
  restrictions: {
    cannotManageSysAdmin: boolean;
    restrictedModules: string[];
  };
  permissions: Record<string, string[]>;
  createdAt: string;
  updatedAt: string;
  __v: number;
};
