import { ConfigService } from '@nestjs/config';

export type ServiceUrls = {
  user: string;
  auth: string;
  page: string;
  log: string;
  product: string;
  order: string;
};

export const serviceUrl = (config: ConfigService): ServiceUrls => ({
  user: `http://${config.get('USER_SERVICE_HOST')}:${config.get('USER_SERVICE_PORT')}`,
  auth: `http://${config.get('AUTH_SERVICE_HOST')}:${config.get('AUTH_SERVICE_PORT')}`,
  page: `http://${config.get('PAGE_SERVICE_HOST')}:${config.get('PAGE_SERVICE_PORT')}`,
  log: `http://${config.get('LOG_SERVICE_HOST')}:${config.get('LOG_SERVICE_PORT')}`,
  product: `http://${config.get('PRODUCT_SERVICE_HOST')}:${config.get('PRODUCT_SERVICE_PORT')}`,
  order: `http://${config.get('ORDER_SERVICE_HOST')}:${config.get('ORDER_SERVICE_PORT')}`,
});
