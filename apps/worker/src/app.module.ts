import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { DispatchProcessor } from './dispatch/dispatch.processor';
import { DispatchCronService } from './dispatch/dispatch.cron';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ScheduleModule.forRoot(),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                connection: { host: 'localhost', port: 6379 },
            }),
            inject: [ConfigService],
        }),
        BullModule.registerQueue({ name: 'dispatch-queue' }),
    ],
    providers: [DispatchProcessor, DispatchCronService],
})
export class AppModule { }
