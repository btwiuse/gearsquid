import {
  Column as Column_,
  Entity as Entity_,
  Index as Index_,
  PrimaryColumn as PrimaryColumn_,
} from "typeorm";

@Entity_()
export class AddedMsg {
  constructor(props?: Partial<AddedMsg>) {
    Object.assign(this, props);
  }

  @PrimaryColumn_()
  id!: string;

  @Index_()
  @Column_("int4", { nullable: false })
  blockNumber!: number;

  @Index_()
  @Column_("timestamp with time zone", { nullable: false })
  timestamp!: Date;

  @Index_()
  @Column_("text", { nullable: false })
  by!: string;

  @Column_("text", { nullable: false })
  msg!: string;
}
