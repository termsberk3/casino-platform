import { DataSource } from 'typeorm';

import { CountryEntity } from '../../countries/entities/country.entity';

const countries: Array<Pick<CountryEntity, 'isoCode' | 'name'>> = [
  {
    isoCode: 'TR',
    name: 'Türkiye',
  },
  {
    isoCode: 'US',
    name: 'United States',
  },
  {
    isoCode: 'GB',
    name: 'United Kingdom',
  },
  {
    isoCode: 'DE',
    name: 'Germany',
  },
  {
    isoCode: 'FR',
    name: 'France',
  },
];

export async function seedCountries(dataSource: DataSource): Promise<void> {
  const countryRepository = dataSource.getRepository(CountryEntity);

  await countryRepository.upsert(countries, {
    conflictPaths: ['isoCode'],
    skipUpdateIfNoValuesChanged: true,
  });

  console.log(`✓ ${countries.length} countries seed done.`);
}
