import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { GameCountryEntity } from './game-country.entity';

@Entity('countries')
@Check('"iso_code" = UPPER("iso_code")')
@Index('uq_countries_iso_code', ['isoCode'], { unique: true })
@Index('uq_countries_name', ['name'], { unique: true })
export class CountryEntity {
  @PrimaryGeneratedColumn('increment', {
    type: 'bigint',
  })
  id!: string;

  @Column({
    name: 'iso_code',
    type: 'char',
    length: 2,
  })
  isoCode!: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  name!: string;

  @OneToMany(() => GameCountryEntity, (gameCountry) => gameCountry.country)
  gameCountries!: GameCountryEntity[];

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;
}
