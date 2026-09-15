import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RgpdEraseDto } from './rgpd-erase.dto';

describe('RgpdEraseDto', () => {
  it('accepts a valid UUID', async () => {
    const dto = plainToInstance(RgpdEraseDto, {
      customerId: '550e8400-e29b-41d4-a716-446655440000',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a missing customerId', async () => {
    const dto = plainToInstance(RgpdEraseDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('customerId');
  });

  it('rejects a non-UUID value', async () => {
    const dto = plainToInstance(RgpdEraseDto, {
      customerId: 'not-a-uuid',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('customerId');
  });

  it('rejects an empty string', async () => {
    const dto = plainToInstance(RgpdEraseDto, {
      customerId: '',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('customerId');
  });
});
