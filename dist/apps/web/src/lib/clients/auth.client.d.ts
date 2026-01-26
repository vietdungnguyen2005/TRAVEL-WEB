import { LoginRequest, LoginResponse } from '@travel-web/contracts';
declare const authClient: {
    login(data: LoginRequest): Promise<LoginResponse>;
    register(data: LoginRequest): Promise<LoginResponse>;
    forgotPassword(email: string): Promise<void>;
};
export default authClient;
//# sourceMappingURL=auth.client.d.ts.map