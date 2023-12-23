namespace sello.Models.Stripe
{
    public class CheckoutSessionRequest
    {
        public ulong ProductId { get; set; }
        public string SuccessUrl { get; set; }
        public string CancelUrl { get; set; }
    }
}
