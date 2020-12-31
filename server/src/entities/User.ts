import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Post } from "./Post";
import { Updoot } from "./Updoot";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @OneToMany(() => Post, post => post.creator, {
    // onDelete: "CASCADE"
  })
  posts: Post[];

  @OneToMany(() => Updoot, updoot => updoot.user, {
    // onDelete: "CASCADE"
  })
  updoots: Updoot[];

  @Field()
  @Column({ unique: true })
  username!: string;
  
  @Field()
  @Column({ unique: true })
  email!: string;
  
  @Column()
  password!: string;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
