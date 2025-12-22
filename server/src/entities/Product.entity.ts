import { Entity, PrimaryKey, Property, OneToMany, Collection, Opt, DecimalType } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { Inventory } from './Inventory.entity.js';

@Entity()
export class Product {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @Property({ length: 255, unique: true, type: 'text' })
  name!: string;

  @Property({ length: 100, type: 'text' })
  category!: string;

  @Property({ type: new DecimalType('number'), precision: 10, scale: 2 })
  price!: number;

  @Property({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => Inventory, (inv) => inv.product)
  inventory = new Collection<Inventory>(this);

  @Property()
  createdAt: Opt & Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Opt & Date = new Date();
}
