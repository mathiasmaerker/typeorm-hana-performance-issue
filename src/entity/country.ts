import { Entity, Column, PrimaryColumn } from 'typeorm'

/**
 * Representation of a country
 */
@Entity({ name: 'p4c_country' })
export class Country {
  @PrimaryColumn()
  id: number

  @Column({ length: 2 })
  alpha2: string
  @Column({ length: 3 })
  alpha3: string
}
