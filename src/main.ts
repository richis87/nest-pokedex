import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/V2')
  

  app.useGlobalPipes(    
    new ValidationPipe({ 
      whitelist: true, 
     forbidNonWhitelisted: true,   
     //***************************
     //Esto permita la transformación automática de los parámetros que llegan en el API
     transform:true,
     transformOptions:{
      enableImplicitConversion: true,
     }
     //************************** */
  }));

  
  await app.listen(process.env.PORT);
  console.log(`App running on port ${process.env.PORT}`)
}
bootstrap();
