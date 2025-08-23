# Dashboard Setup with Real Supabase Data

This document explains how to set up the updated dashboard that uses real data from your Supabase database instead of static data.

## What's Been Updated

1. **EcommerceMetrics**: Now shows real user count and order count from the database
2. **MonthlySalesChart**: Displays actual monthly sales data from orders with 'paid' status
3. **RecentOrders**: Shows orders grouped by country from the profiles table
4. **Removed**: DemographicCard component as requested

## Database Setup

### 1. Run the SQL Script

Copy and paste the contents of `database-setup.sql` into your Supabase SQL editor and run it. This will:

- Create the necessary tables (`users`, `profiles`, `orders`)
- Set up proper indexes for performance
- Enable Row Level Security (RLS)
- Create sample data for testing

### 2. Table Structure

#### Users Table

- `id`: UUID primary key
- `email`: User email address
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### Profiles Table

- `id`: UUID primary key
- `user_id`: References users table
- `country`: User's country
- `created_at`: Timestamp
- `updated_at`: Timestamp

#### Orders Table

- `id`: UUID primary key
- `user_id`: References users table
- `status`: Order status ('pending', 'paid', 'cancelled', 'delivered')
- `total_amount`: Order total (decimal)
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Environment Variables

Make sure you have these environment variables set in your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## How It Works

### 1. Data Fetching

The `useDashboardData` hook fetches data from Supabase:

- **User Count**: Total count from users table
- **Order Count**: Total count from orders table
- **Monthly Sales**: Sum of total_amount from orders with status 'paid', grouped by month
- **Orders by Country**: Count of orders grouped by country from profiles table

### 2. Real-time Updates

The dashboard automatically fetches fresh data when the component mounts. You can add refresh functionality by calling the hook again or implementing a refresh button.

### 3. Error Handling

All components include loading states and error handling for a better user experience.

## Customization

### Adding More Metrics

To add more dashboard metrics:

1. Update the `DashboardData` interface in `useDashboardData.ts`
2. Add the data fetching logic in the hook
3. Update the component to use the new data

### Modifying Queries

You can customize the Supabase queries in `useDashboardData.ts` to:

- Filter data by date ranges
- Add more complex aggregations
- Include additional table joins

### Styling

All components use Tailwind CSS classes and can be easily customized to match your design system.

## Performance Considerations

- The dashboard fetches data once on mount
- Consider implementing caching if you have frequent data updates
- For large datasets, consider pagination or limiting results
- The SQL script includes indexes for better query performance

## Troubleshooting

### Common Issues

1. **No data showing**: Check if your tables have data and RLS policies are correct
2. **Connection errors**: Verify your Supabase credentials
3. **Type errors**: Make sure the database types match your actual table structure

### Debug Mode

You can add console logs in the `useDashboardData` hook to debug data fetching:

```typescript
console.log("Fetched data:", {
  userCount,
  orderCount,
  monthlySales,
  ordersByCountry,
});
```

## Next Steps

1. Run the database setup script
2. Test with sample data
3. Replace sample data with your actual data
4. Customize the dashboard layout and styling as needed
5. Add authentication if required
6. Implement real-time updates using Supabase subscriptions

## Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify your Supabase table structure matches the expected schema
3. Ensure your RLS policies allow the necessary access
4. Check that your environment variables are correctly set


