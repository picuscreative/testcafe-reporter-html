import { fixture, test } from 'testcafe';
import fs from 'fs';
import path from 'path';
import createReport from '../utils/create-report';
import page from './page-model';

const RESULT_REPORT_NAME = 'result-report.html';
const REPORT_PATH = path.join(process.cwd(), RESULT_REPORT_NAME);
const SORTING_ORDERS = {
  ascending: {
    expectedValues: ['0', '23000', '54000', '71000', '74000', '81000', '148000'],
    expectedTexts: ['0s', '23s', '54s', '1m 11s', '1m 14s', '1m 21s', '2m 28s'],
    clicksCount: 1,
  },
  descending: {
    expectedValues: ['148000', '81000', '74000', '71000', '54000', '23000', '0'],
    expectedTexts: ['2m 28s', '1m 21s', '1m 14s', '1m 11s', '54s', '23s', '0s'],
    clicksCount: 2,
  },
};

fixture`Sorting`
  .before(() => {
    const report = createReport(true);

    fs.writeFileSync(REPORT_PATH, report);
  })
  .after(() => {
    fs.unlinkSync(REPORT_PATH);
  })
  .page(REPORT_PATH);

const getDurationInfo = (_, i) => page.getCellInfo(i, page.columns.duration.index);

Object.entries(SORTING_ORDERS)
  .forEach(([sortOrder, {
    expectedValues,
    expectedTexts,
    clicksCount,
  }]) => {
    test(`[Sorting] Column: Duration, Sorting order: ${sortOrder}`, async (t) => {
      await t.customActions.clickMultipleTimes(page.columns.duration.header, clicksCount);

      const cellInfos = await Promise.all(expectedValues.map(getDurationInfo));

      const values = cellInfos.map((c) => c.value);
      const texts = cellInfos.map((c) => c.text);

      await t.expect(values)
        .eql(expectedValues);
      await t.expect(texts)
        .eql(expectedTexts);
    });
  });
