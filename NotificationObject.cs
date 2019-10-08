namespace MCAddonSetupManager
{
    using System.ComponentModel;

    public class NotificationObject : INotifyPropertyChanged
    {
        public event PropertyChangedEventHandler PropertyChanged;

        protected virtual void RaisePropertyChanged(string propertyName = null)
        {
            var h = PropertyChanged;
            if (h != null)
                h(this, new PropertyChangedEventArgs(propertyName));
        }

        protected virtual bool SetProperty<T>(ref T target, T value, string propertyName = null)
        {
            target = value;
            RaisePropertyChanged(propertyName);
            return true;
        }
    }
}
