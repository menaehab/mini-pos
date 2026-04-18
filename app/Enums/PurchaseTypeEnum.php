<?php

namespace App\Enums;

enum PurchaseTypeEnum: string
{
    const CASH = 'cash';

    const CREDIT = 'credit';

    public static function values(): array
    {
        return [
            self::CASH,
            self::CREDIT,
        ];
    }
}
