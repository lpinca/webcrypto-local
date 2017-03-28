import { Type, Schema } from 'quantizer';

export default new Schema('Key', {
  id: Type.ObjectID,
  name: Type.String,
  createdAt: Type.String,
  lastUsed: Type.String,
  algorithm: Type.String,
  size: Type.Number,
  usages: Type.List,
  selected: Type.Boolean,
});
