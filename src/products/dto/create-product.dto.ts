import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsIn,
  Min,
  IsNotEmpty,
} from 'class-validator';

export class CreateProductDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(1)
  price: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  originalPrice?: number;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsIn(['men', 'women', 'kids'])
  gender: 'men' | 'women' | 'kids';

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  sizes: string[];

  @IsArray()
  @IsString({ each: true })
  colors: string[];
}
