<?php

const MYSQL_SERVER = '127.0.0.1';
const MYSQL_USER = 'money';
const MYSQL_PSWD = 'Gg44gG77';
const MYSQL_DB = 'scopetrack';

$mysqli = new mysqli(MYSQL_SERVER, MYSQL_USER, MYSQL_PSWD, MYSQL_DB);
    if (mysqli_connect_errno())
        die('Failed to connect to MySQL: ' . mysqli_connect_error());
$stmt = $mysqli->prepare('
    SELECT
        s.mon,
        s.total_spending,
        COALESCE(i.total_income, 0) total_income
    FROM (
        SELECT
            DATE_FORMAT(spending_date, \'%Y-%m-01\') AS mon,
            SUM(spending_amount) total_spending
        FROM
            spending
        GROUP BY
            1
    ) s LEFT JOIN (
        SELECT
            DATE_FORMAT(income_date, \'%Y-%m-01\') AS mon,
            SUM(income_amount) total_income
        FROM
            income
        GROUP BY
            1
    ) i ON s.mon = i.mon
    ORDER BY
        1;
');
$stmt->execute();
$stmt->bind_result(
    $month,
    $total_spending,
    $total_income
);
$return = '';
while($stmt->fetch()) {
    $return = $return .
        $month . '\t' .
        $total_spending . '\t' .
        $total_income . '\n';
}
$stmt->close();
$mysqli->close();

print $return;
