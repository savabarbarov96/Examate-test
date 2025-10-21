import { Role } from "../roles/types";

export type CreateUserPayload = {
  email: string;
  username: string;
  role: string;
  firstName: string;
  lastName: string;
  client: string;
  phone?: string;
  dob?: string;
  profilePic?: string;
};

export type UpdateUserPayload = {
  _id: string;
  email: string;
  username: string;
  role: string;
  firstName: string;
  lastName: string;
  client: string;
  phone?: string;
  dob?: string;
  profilePic?: string;
};

export type GetUserPayload = {
  _id: string;
  email: string;
  username: string;
  role: Role;
  firstName: string;
  lastName: string;
  client: string;
  phone?: string;
  dob?: string;
  profilePic?: string;
};
