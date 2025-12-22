import { Entity, PrimaryKey, Property, ManyToOne, Index, Unique, Opt, type Rel } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { Store } from './Store.entity.js';
import { Product } from './Product.entity.js';

@Entity()
@Unique({ properties: ['store', 'product'] })
export class Inventory {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => Store, { deleteRule: 'cascade' })
  @Index()
  store!: Rel<Store>;

  @ManyToOne(() => Product, { deleteRule: 'cascade' })
  @Index()
  product!: Rel<Product>;

  @Property({ type: 'int', unsigned: true })
  quantity!: number;

  @Property()
  createdAt: Opt & Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Opt & Date = new Date();
}
