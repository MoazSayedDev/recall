import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GeminiModule } from './gemini/gemini.module';
import { RagModule } from './rag/rag.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    GeminiModule,
    RagModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
