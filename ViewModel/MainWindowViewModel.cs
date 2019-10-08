using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MCAddonSetupManager.ViewModels
{
    class MainWindowViewModel : NotificationObject
    {
        private string text1;
        public string Text1
        {
            get { return text1; }
            set { SetProperty(ref text1, value); }
        }
    }
}
