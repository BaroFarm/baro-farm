import React from 'react';
import ShopNav from '../components/common/ShopNav';
import PromoBanner from '../components/common/PromoBanner';
import SeasonalProduct from '../components/common/product/SeasonalProduct';
import Recommendations from '../components/common/product/Recommendations';
import Subscription from '../components/common/product/Subscription';

export default function ShopPage() {

    return (
        <div>
            <ShopNav />
            <PromoBanner />
            <SeasonalProduct />
            <Recommendations />
            <Subscription />
            
        </div>
    );
}