import { Selector } from 'testcafe';

class Page {
  getRow(number) {
    return this.rows.nth(number);
  }

  getCell(rowIndex, colIndex) {
    return this.getRow(rowIndex)
      .child(colIndex);
  }

  async getCellInfo(rowIndex, colIndex) {
    const cell = this.getCell(rowIndex, colIndex);
    const text = await cell.innerText;
    const value = await cell.getAttribute('data-value');

    return {
      text,
      value,
    };
  }

  constructor() {
    this.columns = {
      key: {
        index: 0,
        header: Selector('th')
          .withExactText('#'),
      },
      fixture: {
        index: 1,
        header: Selector('th')
          .withExactText('Fixture'),
      },
      testName: {
        index: 2,
        header: Selector('th')
          .withExactText('Test Name'),
      },
      browsers: {
        index: 3,
        header: Selector('th')
          .withExactText('Browsers'),
      },
      duration: {
        index: 4,
        header: Selector('th')
          .withExactText('Duration'),
      },
      result: {
        index: 5,
        header: Selector('th')
          .withExactText('Result'),
      },
    };
    this.rows = Selector('tbody>tr');
  }
}

export default new Page();
