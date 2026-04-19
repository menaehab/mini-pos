<?php

namespace App\Enums;

enum SaleTypeEnum: string
{
    case CASH = 'cash';
    case INSTALLMENT = 'installment';

    public function label(): string
    {
        return match ($this) {
            self::CASH => __('keywords.cash'),
            self::INSTALLMENT => __('keywords.installment'),
        };
    }
}
