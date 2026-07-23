/* eslint-disable no-console */
/**
 * Crée (ou met à jour) un utilisateur OWNER par défaut.
 *
 * Goosee est en database-per-service : l'identité vit dans `auth_db.auth`
 * (email + mot de passe bcrypt + rôle) et le profil dans `user_db.user`,
 * reliés par `authId`. Ce script écrit dans les deux bases en une passe.
 *
 * Idempotent : relançable sans créer de doublon (upsert sur l'email).
 *
 * Usage :
 *   yarn init:user                       # admin@goosee.dev / goosee
 *   INIT_USER_EMAIL=... INIT_USER_PASSWORD=... yarn init:user
 *
 * Pré-requis : la stack doit avoir tourné au moins une fois (yarn infra + yarn dev)
 * pour que TypeORM ait créé les tables. Les bases doivent être accessibles (yarn infra).
 */
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const EMAIL = process.env.INIT_USER_EMAIL || 'admin@goosee.dev';
const PASSWORD = process.env.INIT_USER_PASSWORD || 'goosee';
const FIRST_NAME = process.env.INIT_USER_FIRSTNAME || 'Admin';
const LAST_NAME = process.env.INIT_USER_LASTNAME || 'Goosee';
const ROLE = ['OWNER'];

function authDbConfig() {
  return {
    host: process.env.AUTH_DB_HOST || 'localhost',
    port: Number(process.env.AUTH_DB_PORT || 5433),
    user: process.env.AUTH_DB_USER || 'postgres',
    password: process.env.AUTH_DB_PASSWORD || 'postgres',
    database: process.env.AUTH_DB_NAME || 'auth_db',
  };
}

function userDbConfig() {
  return {
    host: process.env.USER_DB_HOST || 'localhost',
    port: Number(process.env.USER_DB_PORT || 5434),
    user: process.env.USER_DB_USER || 'postgres',
    password: process.env.USER_DB_PASSWORD || 'postgres',
    database: process.env.USER_DB_NAME || 'user_db',
  };
}

async function connect(config, label) {
  const client = new Client(config);
  try {
    await client.connect();
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      throw new Error(
        `Impossible de joindre la base ${label} (${config.host}:${config.port}). ` +
          'Démarre l\'infra avec `yarn infra`.'
      );
    }
    throw err;
  }
  return client;
}

function handleMissingTable(err, label) {
  if (err.code === '42P01') {
    throw new Error(
      `La table "${label}" n'existe pas encore. Lance la stack au moins une fois ` +
        '(`yarn infra` + `yarn dev`) pour que TypeORM crée le schéma, puis relance `yarn init:user`.'
    );
  }
  throw err;
}

async function seedAuth() {
  const client = await connect(authDbConfig(), 'auth_db');
  try {
    const password = await bcrypt.hash(PASSWORD, 12);
    const res = await client.query(
      `INSERT INTO auth (email, password, role, "isVerified", "verifiedAt")
       VALUES ($1, $2, $3, true, now())
       ON CONFLICT (email) DO UPDATE
         SET password = EXCLUDED.password,
             role = EXCLUDED.role,
             "isVerified" = true,
             "verifiedAt" = now()
       RETURNING id`,
      [EMAIL, password, ROLE]
    );
    return res.rows[0].id;
  } catch (err) {
    handleMissingTable(err, 'auth');
  } finally {
    await client.end();
  }
}

async function seedUser(authId) {
  const client = await connect(userDbConfig(), 'user_db');
  try {
    await client.query(
      `INSERT INTO "user" ("authId", email, "firstName", "lastName", role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE
         SET "authId" = EXCLUDED."authId",
             role = EXCLUDED.role`,
      [authId, EMAIL, FIRST_NAME, LAST_NAME, ROLE]
    );
  } catch (err) {
    handleMissingTable(err, 'user');
  } finally {
    await client.end();
  }
}

async function main() {
  console.log(`→ Création de l'utilisateur OWNER ${EMAIL}...`);
  const authId = await seedAuth();
  await seedUser(authId);
  console.log('✅ Utilisateur prêt :');
  console.log(`   email    : ${EMAIL}`);
  console.log(`   password : ${PASSWORD}`);
  console.log(`   rôle     : OWNER (compte vérifié)`);
}

main().catch((err) => {
  console.error(`❌ ${err.message}`);
  process.exit(1);
});
