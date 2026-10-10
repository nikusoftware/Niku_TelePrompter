// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.nikutv.com/templates
// (c) 2024 www.nikutv.com/mit-license
// ---------------------------------------

using Niku_Telepromter.Core.Models.Account;

namespace Niku_Telepromter.Core.Models.Shop
{
    public class Order : BaseEntity
    {
        public decimal Discount { get; set; }
        public string? Comments { get; set; }

        public string? CashierId { get; set; }
        public ApplicationUser? Cashier { get; set; }

        public int CustomerId { get; set; }
        public required Customer Customer { get; set; }

        public ICollection<OrderDetail> OrderDetails { get; } = [];
    }
}
