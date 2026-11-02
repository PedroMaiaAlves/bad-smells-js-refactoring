const REPORT_TYPE = Object.freeze({
  CSV: 'CSV',
  HTML: 'HTML',
});

const USER_ROLE = Object.freeze({
  ADMIN: 'ADMIN',
  USER: 'USER',
});

const STANDARD_USER_MAX_VALUE = 500;
const PRIORITY_MIN_VALUE = 1000;

const REPORT_FORMATTERS = Object.freeze({
  [REPORT_TYPE.CSV]: {
    header: () => 'ID,NOME,VALOR,USUARIO\n',
    item: (item, user) =>
      `${item.id},${item.name},${item.value},${user.name}\n`,
    footer: (total) => `\nTotal,,\n${total},,\n`,
  },
  [REPORT_TYPE.HTML]: {
    header: (user) =>
      '<html><body>\n' +
      '<h1>Relatório</h1>\n' +
      `<h2>Usuário: ${user.name}</h2>\n` +
      '<table>\n' +
      '<tr><th>ID</th><th>Nome</th><th>Valor</th></tr>\n',
    item: (item, user) => {
      const style = isPriorityItem(item, user)
        ? ' style="font-weight:bold;"'
        : '';
      return `<tr${style}><td>${item.id}</td><td>${item.name}</td><td>${item.value}</td></tr>\n`;
    },
    footer: (total) =>
      '</table>\n' + `<h3>Total: ${total}</h3>\n` + '</body></html>\n',
  },
});

function isPriorityItem(item, user) {
  return (
    user.role === USER_ROLE.ADMIN &&
    (item.priority || item.value > PRIORITY_MIN_VALUE)
  );
}

function getVisibleItems(user, items) {
  if (user.role === USER_ROLE.ADMIN) {
    return items;
  }

  if (user.role === USER_ROLE.USER) {
    return items.filter((item) => item.value <= STANDARD_USER_MAX_VALUE);
  }

  return [];
}

export class ReportGenerator {
  constructor(database) {
    this.db = database;
  }

  generateReport(reportType, user, items) {
    const formatter = REPORT_FORMATTERS[reportType];

    if (!formatter) {
      return '';
    }

    const visibleItems = getVisibleItems(user, items);
    const total = visibleItems.reduce((sum, item) => sum + item.value, 0);
    const body = visibleItems
      .map((item) => formatter.item(item, user))
      .join('');

    return `${formatter.header(user)}${body}${formatter.footer(total)}`.trim();
  }
}
