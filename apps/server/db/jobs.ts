import { CronJob } from 'cron';
import * as db from './index';
import { getQuery } from '../utils/string';
import type { PageRowObject } from './queries/types';
import type { QueryResult } from 'pg';

const deleteExpiredPages = new CronJob('0 0 * * *', async () => {
  const client = await db.getClient();

  try {
    const { rowCount }: QueryResult<PageRowObject> = await db.query(
      getQuery('delete-pages'),
    );

    console.log(
      `Job: Delete expired pages\n
       at ${new Date()}\n
       Deleted pages: ${rowCount}`,
    );
  } catch (error) {
    console.error(error);
  } finally {
    client.release();
  }
});

export default { deleteExpiredPages };