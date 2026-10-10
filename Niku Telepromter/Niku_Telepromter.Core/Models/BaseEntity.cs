// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.nikutv.com/templates
// (c) 2024 www.nikutv.com/mit-license
// ---------------------------------------

using System.ComponentModel.DataAnnotations;

namespace Niku_Telepromter.Core.Models
{
    public class BaseEntity : IAuditableEntity
    {
        public int Id { get; set; }

        [MaxLength(40)]
        public string? CreatedBy { get; set; }

        [MaxLength(40)]
        public string? UpdatedBy { get; set; }

        public DateTime UpdatedDate { get; set; }

        public DateTime CreatedDate { get; set; }
    }
}
