import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import RecentOrders from "../../components/ecommerce/RecentOrders";
import PageMeta from "../../components/common/PageMeta";
import { useEffect, useState } from "react";
import { supabaseClient } from "../../service/supabase";

export default function Home() {
  const [data, setData] = useState<any>({});
  const fetchData = async () => {
    const res = await supabaseClient.rpc("get_orders_profiles_stats");
    setData(res.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <PageMeta
        title="React.js Ecommerce Dashboard | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Ecommerce Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics
            userCount={data?.total_users ?? 0}
            orderCount={data?.total_orders ?? 0}
          />

          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentOrders data={data?.orders_by_country ?? []} />
        </div>
      </div>
    </>
  );
}
