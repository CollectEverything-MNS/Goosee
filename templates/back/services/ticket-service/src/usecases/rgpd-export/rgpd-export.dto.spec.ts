import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RgpdExportDto } from './rgpd-export.dto';

describe('RgpdExportDto', () => {
  it('accepts a valid UUID', async () => {
    const dto = plainToInstance(RgpdExportDto, {
      customerId: '550e8400-e29b-41d4-a716-446655440000',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a missing customerId', async () => {
    const dto = plainToInstance(RgpdExportDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('customerId');
  });

  it('rejects a non-UUID value', async () => {
    const dto = plainToInstance(RgpdExportDto, {
      customerId: 'not-a-uuid',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('customerId');
  });

  it('rejects an empty string', async () => {
    const dto = plainToInstance(RgpdExportDto, {
      customerId: '',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('customerId');
  });
});
