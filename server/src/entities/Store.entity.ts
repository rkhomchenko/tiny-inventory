import { Entity, PrimaryKey, Property, OneToMany, Collection, Opt } from '@mikro-orm/core';
import { v4 as uuidv4 } from 'uuid';
import { Inventory } from './Inventory.entity.js';

@Entity()
export class Store {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuidv4();

  @Property({ length: 255, type: 'text' })
  name!: string;

  @Property({ type: 'text', nullable: true })
  address?: string;

  @OneToMany(() => Inventory, (inv) => inv.store)
  inventory = new Collection<Inventory>(this);

  @Property()
  createdAt: Opt & Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Opt & Date = new Date();
}
