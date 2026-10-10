// ---------------------------------------
// Email: quickapp@ebenmonney.com
// Templates: www.nikutv.com/templates
// (c) 2024 www.nikutv.com/mit-license
// ---------------------------------------

namespace Niku_Telepromter.Core.Extensions
{
    public static class ArrayExtensions
    {
        public static T[]? NullIfEmpty<T>(this T[]? value) => value?.Length == 0 ? null : value;

        public static T[]? EmptyIfNull<T>(this T[]? value) => value ?? [];
    }
}
