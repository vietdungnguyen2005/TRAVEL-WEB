import mongoose, { type InferSchemaType } from 'mongoose';
declare const ReviewSchema: mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any, any>, {}, {}, {}, {}, {
    timestamps: true;
    versionKey: false;
}, {
    userId: string;
    bookingId: string;
    roomTypeId: string;
    rating: number;
    comment?: string | null | undefined;
    images?: string[] | null | undefined;
    isVerified?: boolean | null | undefined;
} & mongoose.DefaultTimestampProps, mongoose.Document<unknown, {}, {
    userId: string;
    bookingId: string;
    roomTypeId: string;
    rating: number;
    comment?: string | null | undefined;
    images?: string[] | null | undefined;
    isVerified?: boolean | null | undefined;
} & mongoose.DefaultTimestampProps, {
    id: string;
}, mongoose.ResolveSchemaOptions<{
    timestamps: true;
    versionKey: false;
}>> & Omit<{
    userId: string;
    bookingId: string;
    roomTypeId: string;
    rating: number;
    comment?: string | null | undefined;
    images?: string[] | null | undefined;
    isVerified?: boolean | null | undefined;
} & mongoose.DefaultTimestampProps & {
    _id: mongoose.Types.ObjectId;
}, "id"> & {
    id: string;
}, {
    [path: string]: mongoose.SchemaDefinitionProperty<undefined, any, any>;
} | {
    [x: string]: mongoose.SchemaDefinitionProperty<any, any, mongoose.Document<unknown, {}, {
        userId: string;
        bookingId: string;
        roomTypeId: string;
        rating: number;
        comment?: string | null | undefined;
        images?: string[] | null | undefined;
        isVerified?: boolean | null | undefined;
    } & mongoose.DefaultTimestampProps, {
        id: string;
    }, mongoose.ResolveSchemaOptions<{
        timestamps: true;
        versionKey: false;
    }>> & Omit<{
        userId: string;
        bookingId: string;
        roomTypeId: string;
        rating: number;
        comment?: string | null | undefined;
        images?: string[] | null | undefined;
        isVerified?: boolean | null | undefined;
    } & mongoose.DefaultTimestampProps & {
        _id: mongoose.Types.ObjectId;
    }, "id"> & {
        id: string;
    }> | undefined;
}, {
    userId: string;
    bookingId: string;
    roomTypeId: string;
    rating: number;
    comment?: string | null | undefined;
    images?: string[] | null | undefined;
    isVerified?: boolean | null | undefined;
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>;
export type ReviewDocument = InferSchemaType<typeof ReviewSchema> & {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
};
export declare const ReviewModel: mongoose.Model<any, {}, {}, {}, any, any, any>;
export {};
//# sourceMappingURL=review.model.d.ts.map