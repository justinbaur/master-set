import type {
  Collection,
  CreateCollectionInput,
  UpdateCollectionInput,
} from "@/lib/types/card";

export interface ICollectionRepository {
  findAll(): Promise<Collection[]>;
  findById(id: string): Promise<Collection | null>;
  create(input: CreateCollectionInput): Promise<Collection>;
  update(input: UpdateCollectionInput): Promise<Collection>;
  delete(id: string): Promise<void>;
}
