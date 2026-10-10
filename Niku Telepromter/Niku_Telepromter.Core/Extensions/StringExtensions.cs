// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.nikutv.com/templates
// (c) 2024 www.nikutv.com/mit-license
// ---------------------------------------

namespace Niku_Telepromter.Core.Extensions
{
    public static class StringExtensions
    {
        public static string? NullIfWhiteSpace(this string? value) => string.IsNullOrWhiteSpace(value) ? null : value;
    }
}
