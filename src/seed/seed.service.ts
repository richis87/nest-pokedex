import { ConsoleLogger, Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';


@Injectable()
export class SeedService {
  private  readonly axios: AxiosInstance = axios;

  async executeSeed() {
    //console.log( fetch ) //funciona si node está en la versión 18 o superior
    // Crea una dependencia oculta
    const {data} = await this.axios.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=10');
    
    data.results.forEach( ({name, url})=> {
     // console.log({name, url})

     const segments =url.split('/');
     const no:number = +segments[segments.length - 2]

     console.log({name, no})

    })
    
    //return data.results;
  }
}
