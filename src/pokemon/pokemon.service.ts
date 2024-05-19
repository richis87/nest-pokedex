import { Injectable, Controller, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { Model, isValidObjectId } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {

  private defaultLimit: number;

  constructor(

    // Creado por el equipo de NEST
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService
  ){
   // console.log(process.env.DEFAULT_LIMINT)

    // Esto hace validación de la variable de entorno y si no existe envía un error
    //console.log(configService.getOrThrow('jwt-seed'))

    //console.log(configService.getOrThrow('default_limit'))

    this.defaultLimit=configService.get<number>('default_limit')
    //console.log( defaultLimit )
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();

    try {
      const pokemon = await this.pokemonModel.create( createPokemonDto );
      return pokemon;
      
    } catch (error) {
      this.handleExceptions(error);
    }

 
  }

  findAll(paginationDto: PaginationDto) {

  const { limit = this.defaultLimit, offset = 0 } =     paginationDto

    return this.pokemonModel.find()
    .limit (limit)
    .skip(offset)
    .sort({
      no: 1 //Ordenar la columna no de manera ascendente
    })
    .select('-__v') //Elimina la columna __v del retorno 
  }

  async findOne(term: string) {

    let pokemon: Pokemon;
    if ( !isNaN(+term) ){
      pokemon = await this.pokemonModel.findOne({no: term})
    }

    //MongoID
    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById( term )
    }

    if (!pokemon ) {
      pokemon = await this.pokemonModel.findOne({ name:term.toLocaleLowerCase().trim()})
    }

    // Name

    if (!pokemon) throw new NotFoundException(`pokemon with id, name or no "${term} not found"`)

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    
      const pokemon = await this.findOne(term);
      if ( updatePokemonDto.name )
        updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
  
      // await pokemon.updateOne( updatePokemonDto, { new: true } ); //new: true es para que regrese la nueva información
      // const updatepokemon = await pokemon.updateOne( updatePokemonDto, { new: true } ); 
      try {
      await pokemon.updateOne( updatePokemonDto );
      return {...pokemon.toJSON(),...updatePokemonDto};

    } catch (error) {
      //console.log(error)
      this.handleExceptions(error);
    }
    

}

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();

    //this.pokemonModel.findByIdAndDelete(id)

    //const result = await this.pokemonModel.findByIdAndDelete(id)

    //const result = await this.pokemonModel.deleteOne({  }) // delete * from Pokemon
    const {deletedCount, acknowledged} = await this.pokemonModel.deleteOne({ _id: id  })

    if (deletedCount === 0 )
      throw new BadRequestException(`Pokemon with id "${id}" not found`)

    return ;
  }


  private handleExceptions(error:any)
  {
    if (error.code === 11000 ){
      throw new BadRequestException(`Pokemon exist in db ${ JSON.stringify(error.keyValue)} `)
    }
    console.log(error);
    throw new InternalServerErrorException(`Can't create Pokemon - Check server logs`)
  }
}
  


