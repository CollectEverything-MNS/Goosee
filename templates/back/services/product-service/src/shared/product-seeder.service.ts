import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ICategoryRepository } from '../repositories/category.repository';
import { IProductRepository } from '../repositories/product.repository';
import { IProductImageRepository } from '../repositories/product-image.repository';
import { ITagRepository } from '../repositories/tag.repository';
import { IProductTagRepository } from '../repositories/product-tag.repository';
import { IProductAttributeRepository } from '../repositories/product-attribute.repository';
import { Category } from '../entities/category.entity';
import { Product } from '../entities/product.entity';
import { ProductImage } from '../entities/product-image.entity';
import { Tag } from '../entities/tag.entity';
import { ProductTag } from '../entities/product-tag.entity';
import { ProductAttribute } from '../entities/product-attribute.entity';

interface SeedAttribute {
  key: string;
  value: string;
}

interface SeedProduct {
  name: string;
  description: string;
  price: number;
  preparationTime: number;
  sizeValue?: number;
  sizeUnit?: string;
  imageKeyword: string;
  attributes: SeedAttribute[];
  tags: string[];
}

interface SeedCategory {
  name: string;
  description: string;
  imageKeyword: string;
  products: SeedProduct[];
}

const SEED_CATALOG: SeedCategory[] = [
  {
    name: 'Pains',
    description: 'Nos pains cuits au feu de bois chaque matin.',
    imageKeyword: 'bread',
    products: [
      {
        name: 'Baguette tradition',
        description: 'Baguette à la croûte croustillante et la mie alvéolée, façonnée à la main.',
        price: 1.3,
        preparationTime: 0,
        sizeValue: 250,
        sizeUnit: 'g',
        imageKeyword: 'baguette,bread',
        attributes: [
          { key: 'Poids', value: '250 g' },
          { key: 'Allergènes', value: 'Gluten' },
          { key: 'Conservation', value: 'À consommer le jour même' },
        ],
        tags: ['Fait maison', 'Tradition'],
      },
      {
        name: 'Pain de campagne',
        description: 'Pâte au levain naturel, légèrement acidulée, longue conservation.',
        price: 3.2,
        preparationTime: 0,
        sizeValue: 500,
        sizeUnit: 'g',
        imageKeyword: 'sourdough,bread',
        attributes: [
          { key: 'Poids', value: '500 g' },
          { key: 'Allergènes', value: 'Gluten' },
          { key: 'Levain', value: 'Naturel' },
        ],
        tags: ['Levain', 'Fait maison'],
      },
      {
        name: 'Pain aux céréales',
        description: 'Mélange de graines de tournesol, lin et sésame pour un pain rustique.',
        price: 3.5,
        preparationTime: 0,
        sizeValue: 400,
        sizeUnit: 'g',
        imageKeyword: 'bread,grain',
        attributes: [
          { key: 'Poids', value: '400 g' },
          { key: 'Allergènes', value: 'Gluten, Sésame' },
          { key: 'Graines', value: 'Tournesol, lin, sésame' },
        ],
        tags: ['Bio', 'Fait maison'],
      },
    ],
  },
  {
    name: 'Viennoiseries',
    description: 'Le beurre AOP et le feuilletage maison, tout simplement.',
    imageKeyword: 'croissant',
    products: [
      {
        name: 'Croissant au beurre',
        description: 'Viennoiserie pur beurre AOP, feuilletée, dorée et fondante.',
        price: 1.2,
        preparationTime: 0,
        imageKeyword: 'croissant',
        attributes: [
          { key: 'Beurre', value: 'AOP Charentes-Poitou' },
          { key: 'Allergènes', value: 'Gluten, Lait, Œuf' },
        ],
        tags: ['Pur beurre', 'Fait maison'],
      },
      {
        name: 'Pain au chocolat',
        description: 'Deux barres de chocolat noir enveloppées d\'une pâte feuilletée pur beurre.',
        price: 1.4,
        preparationTime: 0,
        imageKeyword: 'pastry,chocolate',
        attributes: [
          { key: 'Chocolat', value: 'Noir 60%' },
          { key: 'Allergènes', value: 'Gluten, Lait, Œuf, Soja' },
        ],
        tags: ['Pur beurre', 'Fait maison'],
      },
      {
        name: 'Chausson aux pommes',
        description: 'Compote de pommes maison dans un feuilletage croustillant.',
        price: 1.8,
        preparationTime: 0,
        imageKeyword: 'pastry,apple',
        attributes: [
          { key: 'Garniture', value: 'Compote de pommes maison' },
          { key: 'Allergènes', value: 'Gluten, Lait' },
        ],
        tags: ['Fait maison'],
      },
    ],
  },
  {
    name: 'Pâtisseries',
    description: 'Les classiques de la pâtisserie française, faits maison.',
    imageKeyword: 'pastry',
    products: [
      {
        name: 'Éclair au chocolat',
        description: 'Pâte à choux garnie de crème pâtissière au chocolat et glaçage brillant.',
        price: 3.5,
        preparationTime: 0,
        imageKeyword: 'eclair,pastry',
        attributes: [
          { key: 'Crème', value: 'Pâtissière chocolat' },
          { key: 'Allergènes', value: 'Gluten, Lait, Œuf' },
          { key: 'Conservation', value: '24h au réfrigérateur' },
        ],
        tags: ['Fait maison'],
      },
      {
        name: 'Tarte aux fraises',
        description: 'Pâte sablée, crème d\'amande et fraises fraîches de saison.',
        price: 4.2,
        preparationTime: 0,
        imageKeyword: 'tart,strawberry',
        attributes: [
          { key: 'Fruits', value: 'Fraises de saison' },
          { key: 'Allergènes', value: 'Gluten, Lait, Œuf, Fruits à coque' },
          { key: 'Conservation', value: '24h au réfrigérateur' },
        ],
        tags: ['De saison', 'Fait maison'],
      },
      {
        name: 'Flan pâtissier',
        description: 'Appareil à flan vanillé sur fond de pâte, cuit lentement.',
        price: 3.0,
        preparationTime: 0,
        imageKeyword: 'flan,tart',
        attributes: [
          { key: 'Parfum', value: 'Vanille Bourbon' },
          { key: 'Allergènes', value: 'Gluten, Lait, Œuf' },
        ],
        tags: ['Fait maison'],
      },
    ],
  },
  {
    name: 'Boissons',
    description: 'À emporter ou à déguster sur place.',
    imageKeyword: 'coffee',
    products: [
      {
        name: 'Café expresso',
        description: 'Café 100% arabica, torréfaction artisanale, corsé et aromatique.',
        price: 1.8,
        preparationTime: 2,
        sizeValue: 5,
        sizeUnit: 'cl',
        imageKeyword: 'espresso,coffee',
        attributes: [
          { key: 'Origine', value: '100% arabica' },
          { key: 'Intensité', value: '8/10' },
        ],
        tags: ['À emporter'],
      },
      {
        name: 'Jus d\'orange pressé',
        description: 'Oranges pressées minute, sans sucre ajouté.',
        price: 3.5,
        preparationTime: 3,
        sizeValue: 25,
        sizeUnit: 'cl',
        imageKeyword: 'orange,juice',
        attributes: [
          { key: 'Composition', value: '100% orange pressée' },
          { key: 'Sucre ajouté', value: 'Non' },
        ],
        tags: ['Bio', 'À emporter'],
      },
      {
        name: 'Chocolat chaud',
        description: 'Chocolat noir fondu et lait entier mousseux.',
        price: 3.2,
        preparationTime: 4,
        sizeValue: 25,
        sizeUnit: 'cl',
        imageKeyword: 'hot,chocolate',
        attributes: [
          { key: 'Chocolat', value: 'Noir 70%' },
          { key: 'Allergènes', value: 'Lait' },
        ],
        tags: ['À emporter'],
      },
    ],
  },
];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

@Injectable()
export class ProductSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ProductSeederService.name);
  private imageLock = 1;

  constructor(
    private readonly categoryRepo: ICategoryRepository,
    private readonly productRepo: IProductRepository,
    private readonly imageRepo: IProductImageRepository,
    private readonly tagRepo: ITagRepository,
    private readonly productTagRepo: IProductTagRepository,
    private readonly attributeRepo: IProductAttributeRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const existingProducts = await this.productRepo.list();
    const existingNames = new Set(existingProducts.map((p) => p.name));
    const productByName = new Map(existingProducts.map((p) => [p.name, p]));

    const existingCategories = await this.categoryRepo.list();
    const categoryByName = new Map(existingCategories.map((c) => [c.name, c]));

    const existingTags = await this.tagRepo.list();
    const tagBySlug = new Map(existingTags.map((t) => [t.slug, t]));

    let created = 0;

    for (let order = 0; order < SEED_CATALOG.length; order++) {
      const seedCategory = SEED_CATALOG[order];

      let category = categoryByName.get(seedCategory.name);
      if (!category) {
        category = await this.categoryRepo.save(
          new Category({
            name: seedCategory.name,
            description: seedCategory.description,
            imageUrl: this.imageUrl(seedCategory.imageKeyword),
            isActive: true,
            order,
          }),
        );
        categoryByName.set(seedCategory.name, category);
      }

      for (const seed of seedCategory.products) {
        if (existingNames.has(seed.name)) {
          const existing = productByName.get(seed.name);
          if (existing) await this.refreshAutoImage(existing.id, seed.imageKeyword);
          continue;
        }

        const product = await this.productRepo.save(
          new Product({
            name: seed.name,
            description: seed.description,
            price: seed.price,
            preparationTime: seed.preparationTime,
            sizeValue: seed.sizeValue,
            sizeUnit: seed.sizeUnit,
            isAvailable: true,
            categoryId: category.id,
            categoryIds: [category.id],
          }),
        );
        existingNames.add(seed.name);
        created++;

        await this.imageRepo.save(
          new ProductImage({
            productId: product.id,
            url: this.imageUrl(seed.imageKeyword),
            isMain: true,
            order: 0,
          }),
        );

        for (const attr of seed.attributes) {
          const attribute = new ProductAttribute();
          attribute.productId = product.id;
          attribute.key = attr.key;
          attribute.value = attr.value;
          await this.attributeRepo.save(attribute);
        }

        for (const tagName of seed.tags) {
          const slug = slugify(tagName);
          let tag = tagBySlug.get(slug);
          if (!tag) {
            tag = await this.tagRepo.save(new Tag({ name: tagName, slug }));
            tagBySlug.set(slug, tag);
          }
          const link = new ProductTag();
          link.productId = product.id;
          link.tagId = tag.id;
          await this.productTagRepo.save(link);
        }
      }
    }

    if (created > 0) {
      this.logger.log(`Seeded ${created} bakery products across ${SEED_CATALOG.length} categories`);
    } else {
      this.logger.log('Bakery catalog already present, skipping seed');
    }
  }

  /**
   * Rafraichit l'image principale d'un produit deja seede UNIQUEMENT si elle
   * provient d'un placeholder auto (loremflickr / picsum). Ne touche jamais a
   * une image uploadee manuellement via le back-office.
   */
  private async refreshAutoImage(productId: string, keyword: string): Promise<void> {
    const images = await this.imageRepo.listByProductId(productId);
    const main = images.find((img) => img.isMain) ?? images[0];
    if (!main) return;

    const isAuto = /loremflickr\.com|picsum\.photos/.test(main.url);
    if (!isAuto) return;

    main.url = this.imageUrl(keyword);
    await this.imageRepo.save(main);
  }

  /** Image thematique stable (loremflickr) selon un mot-cle. */
  private imageUrl(keyword: string): string {
    const lock = this.imageLock++;
    return `https://loremflickr.com/800/600/${keyword}?lock=${lock}`;
  }
}
