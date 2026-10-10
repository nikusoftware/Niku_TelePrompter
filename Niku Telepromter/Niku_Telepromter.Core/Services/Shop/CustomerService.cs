// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.nikutv.com/templates
// (c) 2024 www.nikutv.com/mit-license
// ---------------------------------------

using Microsoft.EntityFrameworkCore;
using Niku_Telepromter.Core.Infrastructure;
using Niku_Telepromter.Core.Models.Shop;

namespace Niku_Telepromter.Core.Services.Shop
{
    public class CustomerService(ApplicationDbContext dbContext) : ICustomerService
    {
        public IEnumerable<Customer> GetTopActiveCustomers(int count) => throw new NotImplementedException();

        public IEnumerable<Customer> GetAllCustomersData() => dbContext.Customers
                .Include(c => c.Orders).ThenInclude(o => o.OrderDetails).ThenInclude(d => d.Product)
                .Include(c => c.Orders).ThenInclude(o => o.Cashier)
                .AsSingleQuery()
                .OrderBy(c => c.Name)
                .ToList();
    }
}
