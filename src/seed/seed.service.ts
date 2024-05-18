import {  Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { PokemonService } from '../pokemon/pokemon.service';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';


@Injectable()
export class SeedService {
  private  readonly axios: AxiosInstance = axios;

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>
  ){}

  async executeSeed() {

    await this.pokemonModel.deleteMany({}); // delete * from Pokemon
    //console.log( fetch ) //funciona si node está en la versión 18 o superior
    // Crea una dependencia oculta
    const {data} = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');
    
    
    // const insertPromiseArray = [];

    // data.results.forEach( async({name, url})=> {
    //   // console.log({name, url})

    //   const segments =url.split('/');
    //   const no:number = +segments[segments.length - 2]

    // // console.log({name, no})

    // //  await this.pokemonModel.create({name, no});

    // insertPromiseArray.push(
    //   this.pokemonModel.create({name, no})
    // );

    // await Promise.all(insertPromiseArray);
    
    // })

    const pokemonToInsert:{name: string, no: number }[] = [];

    data.results.forEach( async({name, url})=> {
      
      const segments =url.split('/');
      const no:number = +segments[segments.length - 2]
      
      pokemonToInsert.push({name, no});
    
    });

    await this.pokemonModel.insertMany(pokemonToInsert);
    return ('Seed executed');
  }
 
}
