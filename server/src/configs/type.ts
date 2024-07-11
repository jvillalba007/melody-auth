import { Hono } from 'hono'
import { BlankSchema } from 'hono/types'
import { oauthDto } from 'dtos'
import { typeConfig } from 'configs'

export type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  AUTHORIZATION_CODE_JWT_SECRET: string;
  ACCESS_TOKEN_JWT_SECRET: string;
  REFRESH_TOKEN_JWT_SECRET: string;
  ID_TOKEN_JWT_SECRET: string;
};

export type Context = {
  Bindings: Bindings;
  Variables: { AccessTokenBody?: typeConfig.AccessTokenBody };
}

export type App = Hono<Context, BlankSchema, '/'>

export interface AuthCodeBody {
  request: oauthDto.GetAuthorizeReqQueryDto;
  user: {
    oauthId: string;
    email: string | null;
  };
  exp: number;
}

export interface AccessTokenBody {
  sub: string;
  scope: string[];
  exp: number;
}

export interface RefreshTokenBody {
  sub: string;
  scope: string[];
  exp: number;
}

export enum Scope {
  OpenId = 'openid',
  Profile = 'profile',
  OfflineAccess = 'offline_access',
}
